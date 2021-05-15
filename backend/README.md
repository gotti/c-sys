# エンドポイント
## らずぴ側
POST url/locations
←[{"id": "hoge", "x": 100, "y": 100, "fetchedAt": 1621087538}...]
## クライアント側
### 最新1分間のログを取得
GET url/locations
→[{"id": "hoge", "x": 100, "y": 100, "fetchedAt": 1621087538}...]
### 任意の期間のログを取得
GET url/locations?since=1621087500&until=1621087540
→[{"id": "hoge", "x": 100, "y": 100, "fetchedAt": 1621087538}...]
