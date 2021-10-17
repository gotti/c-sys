package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type locationData struct {
	ID        uint   `gorm:"primaryKey" json:"-"`
	DataID    string `json:"id"`
	FetchedAt int64  `json:"fetchedAt"`
	X         int    `json:"x"`
	Y         int    `json:"y"`
}

type gormDB struct {
	*gorm.DB
}

func (db *gormDB) catLocationsWithinMinute(until int64) *[]locationData {
	locations, _ := db.fetchLocationData(until-60, until)
	return locations
}

func (db *gormDB) insertLocationData(locations *[]locationData) {
	for _, l := range *locations {
		db.Create(&l)
	}
}

func (db *gormDB) fetchLocationData(since, until int64) (*[]locationData, error) {
	locations := []locationData{}
	db.Where("fetched_at BETWEEN ? AND ?", since, until).Find(&locations)
	return &locations, nil
}

var db gormDB

func postHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Get("token") != os.Getenv("token") {
		w.WriteHeader(http.StatusForbidden)
		w.Write([]byte("403 Forbidden\n"))
	}
	body, _ := ioutil.ReadAll(r.Body)
	unquoted, err := strconv.Unquote(string(body))
	var data []locationData
	err = json.Unmarshal([]byte(unquoted), &data)
	if err != nil {
		log.Print(err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("500 Internal Server Error\n"))
	}
	db.insertLocationData(&data)
}

func getHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	if query.Get("since") == "" && query.Get("until") == "" {
		//デフォルト動作，最新1分間のデータを取得
		locations := db.catLocationsWithinMinute(time.Now().Unix())
		ret, err := json.Marshal(locations)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Bad Request"))
		}
		fmt.Println(ret)
		w.WriteHeader(http.StatusOK)
		w.Write(ret)
	} else if query.Get("since") != "" && query.Get("until") != "" {
		//sinceとuntilの両方が指定されたらこれ
		since, err := strconv.ParseInt(query.Get("since"), 10, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Bad Request"))
		}
		until, err := strconv.ParseInt(query.Get("until"), 10, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Bad Request"))
		}
		locations, err := db.fetchLocationData(since, until)
		ret, err := json.Marshal(locations)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Bad Request"))
		}
		fmt.Println(ret)
		w.WriteHeader(http.StatusOK)
		w.Write(ret)
	} else {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Bad Request"))
	}
}

func main() {
	d, err := gorm.Open(postgres.Open(os.Getenv("DB")), &gorm.Config{})
	if err != nil {
		fmt.Println(err)
		return
	}
	db = gormDB{d}
	db.AutoMigrate(&locationData{})
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/locations", postHandler).Methods("POST")
	router.HandleFunc("/locations", getHandler).Methods("GET")
	err = http.ListenAndServe(":8080", router)
	if err != nil {
		fmt.Println(err)
		return
	}
}
