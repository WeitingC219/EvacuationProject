# Evacuation Project With A* Alogorithm


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

**Config Database**
```bash
# 在server/index.js裡面，按照提示連接到自己的mongoDB
```

**Config Autodesk Forge**
```bash
在src/components/ModelViewer/autodeskForgeConfig.js裡面，請改成自己上傳好模型那個app的clientId, clientSecret和模型urn，請勿直接拿範例模型app進行上傳或修改之動作。
```