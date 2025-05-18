---
date: 2025-05-18
comments: true
---

# ESP32からSwitchBotにBluetooth接続

ESP32からSwitchBotのボタンを動かしたい。

[ESP32_BLE_Arduino](https://github.com/nkolban/ESP32_BLE_Arduino)というのがあるので、これで試してみる。

[BLE client sample](https://github.com/nkolban/ESP32_BLE_Arduino/blob/master/examples/BLE_client/BLE_client.ino)があるので、てっとり早く動かしてみたが、どうにも動かない。

AdvertiseしているBluetoothデバイスを探し、見つかり次第コールバックが呼ばれるのだけど、このサンプルではこうなっている。

    static BLEUUID serviceUUID("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
    ....
    class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
     /**
       * Called for each advertising BLE server.
       */
      void onResult(BLEAdvertisedDevice advertisedDevice) {
        Serial.print("BLE Advertised Device found: ");
        Serial.println(advertisedDevice.toString().c_str());
    
        // We have found a device, let us now see if it contains the service we are looking for.
        if (advertisedDevice.haveServiceUUID() && advertisedDevice.isAdvertisingService(serviceUUID)) {
    
          BLEDevice::getScan()->stop();
          myDevice = new BLEAdvertisedDevice(advertisedDevice);
          doConnect = true;
          doScan = true;
    
        } // Found our server

このserviceUUIDというのが、SwitchBotのボタン機能なので、それを持っているサービスを探すようになっているんだけど、

    if (advertisedDevice.haveServiceUUID() && advertisedDevice.isAdvertisingService(serviceUUID))
    
このif文の条件が全然成立しない。どうもadvertise deviceというのと、実際のdeviceというのは別物っぽくて、advertise deviceが持っているサービスは```0000fd3d-0000-1000-8000-00805f9b34fb```というUUIDだった。これはAmazon Alexaに見つけてもらうサービスみたい。

なので、ここの条件文は以下のようにしてデバイスアドレスをチェックするように変更したら見つかるようになった。

    String addr = advertisedDevice.getAddress().toString().c_str();
    if (addr.equalsIgnoreCase(addrSwitchBot)) {

デバイスアドレスは、iPhone用のアプリでSwitchBotのデバイス情報から参照できる。なおデバイス情報を確認したらiPhone側のSwitchBotアプリは止めておかないと、ESP32側から接続できないので注意。

<a href="/ruimo-blog/blog/esp32-bt/IMG_2422.PNG" target="_blank">
  <img src="/ruimo-blog/blog/esp32-bt/IMG_2422.PNG" width="400" alt="クリックで拡大">
</a>

あとは、connectAndSendCommand()の中のキャラクタリスティックのチェックが終わったところで以下でボタンを押すコマンドを送れば良い。

    static uint8_t cmdPress[3] = {0x57, 0x01, 0x00};
    ...
    pRemoteCharacteristic->writeValue(cmdPress, sizeof(cmdPress), false);

ソースの全体はこれ。

    #include "BLEDevice.h"
    #include <HardwareSerial.h>
    
    // 手元の SwitchBot のアドレス
    static String addrSwitchBot = "??:??:??:??:??:??";
    // SwitchBot のユーザ定義サービス
    static BLEUUID serviceUUID("cba20d00-224d-11e6-9fb8-0002a5d5c51b");
    // 上記サービス内の対象キャラクタリスティック
    static BLEUUID    charUUID("cba20002-224d-11e6-9fb8-0002a5d5c51b");
    // SwitchBot の Press コマンド
    static uint8_t cmdPress[3] = {0x57, 0x01, 0x00};
    
    static BLEAdvertisedDevice* myDevice = nullptr;
    
    class AdvCallback: public BLEAdvertisedDeviceCallbacks {
      void onResult(BLEAdvertisedDevice advertisedDevice) {
        Serial.println("BLE device found: ");
        String addr = advertisedDevice.getAddress().toString().c_str();
        Serial.printf("addr=[%s]\r\n", addr.c_str());
        if (addr.equalsIgnoreCase(addrSwitchBot)) {
          // SwitchBot を発見
          Serial.println("found SwitchBot");
          advertisedDevice.getScan()->stop();
          myDevice = new BLEAdvertisedDevice(advertisedDevice);
        }
      }
    };
    
    void setup() {
      Serial.begin(115200);
      Serial.println("Setup");
      BLEDevice::init("");
    
      // デバイスからのアドバタイズをスキャン
      BLEScan* pBLEScan = BLEDevice::getScan();
      pBLEScan->setAdvertisedDeviceCallbacks(new AdvCallback());
      pBLEScan->setActiveScan(true);
      pBLEScan->start(30); 
    }
    
    void loop() {
      Serial.println("Loop");
      if (myDevice != nullptr) {
        if (! connectAndSendCommand()) {
          Serial.println("connectAndSendCommand failed");
        }
        myDevice = nullptr;
        Serial.println("done");
      }
      delay(1000);
    }
    
    // Pressコマンド送信
    static bool connectAndSendCommand() {
      Serial.println("start connectAndSendCommand");
      BLEClient* pClient = BLEDevice::createClient();
    
      bool success = pClient->connect(myDevice);
      if (! success) {
        Serial.println(" - Connect failed.");
        return false;
      }
      Serial.println(" - Connected to server");
    
      // 対象サービスを得る
      BLERemoteService* pRemoteService = pClient->getService(serviceUUID);
      if (pRemoteService == nullptr) {
        Serial.println("target service not found");
        return false;
      }
      Serial.println("found target service");
    
      // 対象キャラクタリスティックを得る
      BLERemoteCharacteristic* pRemoteCharacteristic = pRemoteService->getCharacteristic(charUUID);
      if (pRemoteCharacteristic == nullptr) {
        Serial.println("target characteristic not found");
        return false;
      }
      Serial.println("found target characteristic");
    
      // キャラクタリスティックに Press コマンドを書き込む
      pRemoteCharacteristic->writeValue(cmdPress, sizeof(cmdPress), false);
    
      delay(3000);
      pClient->disconnect();
    
      return true;
    }
