# 公路大平台


## Usage

先開啟本機的 mongodb
```bash
# 如果沒有裝過 mongodb
# 可以參考 https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/
brew services start mongodb-community
```

確定本機的 mongodb 有開好之後
```bash
# Run Server
yarn start-server

# 在另一個 `bash tab` Run Frontend
yarn start
```

**Reset Database**

drop 目前 DB 內所有資料，insert 基礎資料進 DB

```
yarn reset-db
```

## API Document

- [User](./doc/api/user/index.md)


## 提交 code

1. 先用 `git checkout -b [new-branch-name]` 建立新的 branch
2. 開始 coding
3. 完成部分功能就 `git commit` 保留紀錄
4. 重複 2~3 直到功能完成
5. 過程中隨時可以 `git push` 將 code 提交到 github 保存
6. run `yarn lint` 確保沒有錯誤，如有錯誤請修復後，再建立 pull request
7. 建立 pull request 並指定其他成員作 reviewers
8. 等待他人 review 後，就會 merge code 進 develop

## 主要 package

- [styled-components](https://www.styled-components.com/)
- [ant-design](https://ant.design/)
- [redux](https://chentsulin.github.io/redux/index.html)

## Folder Structrue

```
src
├── components -> 模組共用 components
└── modules    -> 三大模組檔案
```

## 其他

- [create-react-app](./doc/creat-react-app.md)
