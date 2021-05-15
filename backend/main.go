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
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
)

type locationData struct {
    gorm.Model
    Uuid       string
    Fetched_at int64 `json:"fetchedAt"`
    X          int   `json:"x"`
    Y          int   `json:"y"`
}


type gormDB struct {
    *gorm.DB
}

func (db *gormDB)catLocationsWithinMinute(until int64) *[]locationData{
    locations, _:= db.fetchLocationData(until-60, until)
    return locations
}

func (db *gormDB)insertLocationData(locations *[]locationData) {
    for _, l := range *locations {
        db.Create(l)
    }
}

func (db *gormDB)createTableIfNotExists() error {
    if !db.HasTable(&locationData{}) {
        db.CreateTable(&locationData{})
    }
    return nil
}

func (db *gormDB)fetchLocationData(since, until int64) (*[]locationData, error) {
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
    var data []locationData
    err := json.Unmarshal(body, &data)
    if err != nil {
        log.Fatal(err)
        w.WriteHeader(http.StatusInternalServerError)
        w.Write([]byte("500 Internal Server Error\n"))
    }
    db.insertLocationData(&data)
}

func getHandler(w http.ResponseWriter, r *http.Request){
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
        since,err := strconv.ParseInt(query.Get("since"),10,64)
        if err != nil {
            w.WriteHeader(http.StatusBadRequest)
            w.Write([]byte("Bad Request"))
        }
        until,err := strconv.ParseInt(query.Get("until"),10,64)
        if err != nil {
            w.WriteHeader(http.StatusBadRequest)
            w.Write([]byte("Bad Request"))
        }
        locations,err := db.fetchLocationData(since, until)
        ret, err := json.Marshal(locations)
        if err != nil {
            w.WriteHeader(http.StatusBadRequest)
            w.Write([]byte("Bad Request"))
        }
        fmt.Println(ret)
        w.WriteHeader(http.StatusOK)
        w.Write(ret)
    } else{
        w.WriteHeader(http.StatusBadRequest)
        w.Write([]byte("Bad Request"))
    }
}

func main() {
    d, err := gorm.Open("mysql", os.Getenv("DB"))
    if err != nil {
        fmt.Println(err)
        return
    }
    defer d.Close()
    db = gormDB{d}
    router := mux.NewRouter().StrictSlash(true)
    router.HandleFunc("/locations", postHandler).Methods("POST")
    router.HandleFunc("/locations", getHandler).Methods("GET")
    err = http.ListenAndServe(":8080", router)
    if err != nil {
        fmt.Println(err)
        return
    }
}
