+++
date = "2025-12-21"
title = "ESP32でRustを使ってREST server"
+++

[Lチカ](/diy/micro-controller/esp32/rust)が動いたので、REST serverをRustで実装してみる。

Lチカの時と同様に雛形を作る。名前はrest-serverにした

    cargo generate --git https://github.com/esp-rs/esp-idf-template cargo

JSONが使えるようにCargo.tomlにserdeを追加。あと、http serverは、EspIOErrorというエラー型を使うようで、面倒なのでanyhowも使うことにした。

```
[dependencies]
...
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
```

main.rsはこんな感じ。

```rust
use esp_idf_svc::eventloop::EspSystemEventLoop;
use esp_idf_svc::hal::prelude::Peripherals;
use esp_idf_svc::http::server::{Configuration, EspHttpServer};
use esp_idf_svc::http::Method;
use esp_idf_svc::ipv4;
use esp_idf_svc::netif::{EspNetif, NetifConfiguration, NetifStack};
use esp_idf_svc::nvs::EspDefaultNvsPartition;
use esp_idf_svc::wifi::{AuthMethod, BlockingWifi, EspWifi, WifiDriver};
use esp_idf_svc::io::{EspIOError, Write};
use esp_idf_svc::ipv4::{
    ClientConfiguration as IpClientConfiguration, ClientSettings as IpClientSettings,
    Configuration as IpConfiguration, Mask, Subnet,
};
use esp_idf_svc::wifi::{ClientConfiguration, Configuration as WifiConfiguration};
use std::net::Ipv4Addr;
use std::result::Result;
use std::str::FromStr;
use log::info;

const SSID: &str = env!("ESP32_WIFI_SSID");
const PASSWORD: &str = env!("ESP32_WIFI_PASS");
const DEVICE_IP: &str = env!("ESP_DEVICE_IP");
const GATEWAY_IP: &str = env!("GATEWAY_IP");
const GATEWAY_NETMASK: Option<&str> = option_env!("GATEWAY_NETMASK");

fn main() -> anyhow::Result<()> {
    esp_idf_svc::sys::link_patches();
    esp_idf_svc::log::EspLogger::initialize_default();

    let peripherals = Peripherals::take()?;
    let sys_loop = EspSystemEventLoop::take()?;
    let nvs = EspDefaultNvsPartition::take()?;

    let wifi = WifiDriver::new(peripherals.modem, sys_loop.clone(), Some(nvs))?;
    let wifi = configure_wifi(wifi)?;
    let mut wifi = BlockingWifi::wrap(wifi, sys_loop)?;
    connect_wifi(&mut wifi)?;    

    // サーバー設定とインスタンス化
    let mut server = EspHttpServer::new(&Configuration::default())?;

    // GETエンドポイントの登録
    server.fn_handler("/", Method::Get, |req| {
        req.into_ok_response()?.write_all(b"Hello from Rust REST Server!")?;
        Ok::<(), EspIOError>(())
    })?;

    // POSTエンドポイント（JSONデータの受信など）
    server.fn_handler("/api/data", Method::Post, |mut req| {
        let mut buf = [0u8; 100];
        let len = req.read(&mut buf).unwrap();
        // ここでserde等を使ってbufをパースする処理
        
        req.into_ok_response()?.write_all(b"Data received")?;
        Ok::<(), EspIOError>(())
    })?;

    loop {
        std::thread::sleep(std::time::Duration::from_secs(60));
    }
}

fn configure_wifi(wifi: WifiDriver) -> anyhow::Result<EspWifi> {
    let netmask = GATEWAY_NETMASK.unwrap_or("24");
    let netmask = u8::from_str(netmask)?;
    let gateway_addr = Ipv4Addr::from_str(GATEWAY_IP)?;
    let static_ip = Ipv4Addr::from_str(DEVICE_IP)?;

    let mut wifi = EspWifi::wrap_all(
        wifi,
        EspNetif::new_with_conf(&NetifConfiguration {
            ip_configuration: Some(IpConfiguration::Client(IpClientConfiguration::Fixed(
                IpClientSettings {
                    ip: static_ip,
                    subnet: Subnet {
                        gateway: gateway_addr,
                        mask: Mask(netmask),
                    },
                    // Can also be set to Ipv4Addrs if you need DNS
                    dns: None,
                    secondary_dns: None,
                },
            ))),
            ..NetifConfiguration::wifi_default_client()
        })?,

        EspNetif::new(NetifStack::Ap)?,
    )?;

    let wifi_configuration = WifiConfiguration::Client(ClientConfiguration {
        ssid: SSID.try_into().unwrap(),
        bssid: None,
        auth_method: AuthMethod::WPA2Personal,
        password: PASSWORD.try_into().unwrap(),
        channel: None,
        ..Default::default()
    });
    wifi.set_configuration(&wifi_configuration)?;

    Ok(wifi)
}

fn connect_wifi(wifi: &mut BlockingWifi<EspWifi<'static>>) -> Result<(), esp_idf_svc::sys::EspError> {
     let wifi_configuration: esp_idf_svc::wifi::Configuration = esp_idf_svc::wifi::Configuration::Client(esp_idf_svc::wifi::ClientConfiguration {
        ssid: SSID.try_into().unwrap(),
        bssid: None,
        auth_method: AuthMethod::WPA2Personal,
        password: PASSWORD.try_into().unwrap(),
        channel: None,
        ..Default::default()
    });

    wifi.set_configuration(&wifi_configuration)?;

    wifi.start()?;
    info!("Wifi started");

    wifi.connect()?;
    info!("Wifi connected");

    wifi.wait_netif_up()?;
    info!("Wifi netif up");

    Ok(())
}
```

Wi-FiのSSID/パスワードなどはビルドの時に環境変数で渡すので、これらの環境変数を設定してからcargo buildする。DNSは指定していないけど、必要なら同じように環境変数から渡せば良い。

```rust
const SSID: &str = env!("ESP32_WIFI_SSID");
const PASSWORD: &str = env!("ESP32_WIFI_PASS");
const DEVICE_IP: &str = env!("ESP_DEVICE_IP");
const GATEWAY_IP: &str = env!("GATEWAY_IP");
const GATEWAY_NETMASK: Option<&str> = option_env!("GATEWAY_NETMASK");
```

デフォルトのままだと、こんなエラーになる。

```
ESP-ROM:esp32c2-eco4-20240515                                      
Build:May 15 2024                                                  
rst:0x1 (POWERON),boot:0xc (SPI_FAST_FLASH_BOOT) 
SPIWP:0xee                   
mode:DIO, clock div:2                                                                                                                  
load:0x3fcd5c80,len:0x1608                                                                                                             
load:0x403ac370,len:0xbec                                                                                                              
load:0x403aeb70,len:0x2a90                                                                                                             
entry 0x403ac37a                                                   
I (32) boot: ESP-IDF v5.5.1-838-gd66ebb86d2e 2nd stage bootloader
I (32) boot: compile time Nov 27 2025 10:07:13
I (32) boot: chip revision: v2.0
I (35) boot: efuse block revision: v0.1
I (40) boot.esp32c2: MMU Page Size  : 64K
I (46) boot.esp32c2: SPI Speed      : 30MHz
I (52) boot.esp32c2: SPI Mode       : DIO
I (58) boot.esp32c2: SPI Flash Size : 4MB
I (63) boot: Enabling RNG early entropy source...
I (70) boot: Partition Table:
I (74) boot: ## Label            Usage          Type ST Offset   Length
I (84) boot:  0 nvs              WiFi data        01 02 00009000 00006000
I (94) boot:  1 phy_init         RF data          01 01 0000f000 00001000
I (104) boot:  2 factory          factory app      00 00 00010000 003f0000
I (114) boot: End of partition table
E (119) esp_image: Segment 0 load address 0x3c0c8020, doesn't match data 0x00010020
E (131) boot: Factory app partition is not bootable
E (138) boot: No bootable app partitions in the partition table
```

ビルドの時のログを良く見ると、

```
Chip type:         esp32c2 (revision v2.0)             
Crystal frequency: 26 MHz                                          
Flash size:        4MB       
Features:          WiFi, BLE                                                                                                           
MAC address:       XXXXX
App/part. size:    1,141,120/4,128,768 bytes, 27.64%                                                                 
```

アプリケーションのサイズが1MBを越えていることが分かる。デフォルトではプログラムサイズが最大で1MBまでしか書けないため、設定を変更する必要がある。

まずpartitions.csvというファイルを作る。factoryというところがプログラムのサイズのようだ。

```
# Name,   Type, SubType, Offset,  Size, Flags
nvs,      data, nvs,     ,        0x4000,
otadata,  data, ota,     ,        0x2000,
phy_init, data, phy,     ,        0x1000,
factory,  app,  factory, ,        0x200000,
```

sdkconfig.defaultsに以下を追加。ESP8684はフラッシュが4MBあるので、この設定で動く。

```
CONFIG_ESPTOOLPY_FLASHSIZE_4MB=y
CONFIG_PARTITION_TABLE_CUSTOM=y
CONFIG_PARTITION_TABLE_CUSTOM_FILENAME="$ENV{CARGO_MANIFEST_DIR}/partitions.csv"
CONFIG_PARTITION_TABLE_FILENAME="$ENV{CARGO_MANIFEST_DIR}/partitions.csv"
```

Cargo.tomlの設定を追加して、よりサイズの削減を追求する。

```
[profile.release]
opt-level = "s"
lto = "fat"          # リンク時最適化を最大にする
codegen-units = 1    # コンパイル単位を1にして最適化を強める
panic = "abort"      # パニック時の巻き戻しを無効化（サイズ削減）
```

あとは、ビルドの時にreleaseビルドにする。

```
cargo clean
cargo run --release
```

これで動くようになった。

```
Chip type:         esp32c2 (revision v2.0)               
Crystal frequency: 26 MHz                                          
Flash size:        4MB          
Features:          WiFi, BLE                                       
MAC address:       XXXXX
App/part. size:    890,256/4,128,768 bytes, 21.56% 
```

アプリのサイズを見ていると890KBくらいまで小さくなった。

```
...
I (5004) rest_server: Wifi connected
I (5004) rest_server: Wifi netif up
I (5014) esp_idf_svc::http::server: Started Httpd server with config Configuration { http_port: 80, ctrl_port: 32768, https_port: 443, max_sessions: 16, session_timeout: 1200s, stack_size: 6144, max_open_sockets: 4, max_uri_handlers: 32, max_resp_headers: 8, lru_purge_enable: true, uri_match_wildcard: false }
I (5054) esp_idf_svc::http::server: Registered Httpd server handler Get for URI "/"
I (5064) wifi:AP's beacon interval = 102400 us, DTIM period = 1
I (5074) esp_idf_svc::http::server: Registered Httpd server handler Post for URI "/api/data"
```

こんな感じで"/"と"/api/data"で待ち受けているので、curlで試してみる。

```
$ curl http://192.168.0.252
Hello from Rust REST Server!
```

```
$ curl -X POST http://192.168.0.252/api/data
Data received
```

192.168.0.252の部分は、ESP_DEVICE_IPで指定したもの。なおスタックが小さいので無造作に大きな配列などをローカル変数で取るとスタックが溢れるので注意せよとのこと。
