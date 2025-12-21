+++
date = "2025-12-21"
title = "ESP32でRustを使用する"
+++

ESP32でRustを使用した開発。[「Rust × ESP32」で始める組み込み開発：Lチカまでの完全セットアップガイド](https://developer.mamezou-tech.com/blogs/2025/05/19/using-rust-02/)に記載されている内容に従った。

今回は秋月で最近発売になった[ESP8684のdevボード](https://akizukidenshi.com/catalog/g/g131162/)を使用。USBケーブルでPCに接続しておく。

<a href="https://akizukidenshi.com/catalog/g/g131162/">
<img src="https://akizukidenshi.com/img/goods/L/131162.jpg">
</a>

## 準備

- Lubuntu 24.04(Ubuntu 24.04と同等)
- Rustなどは上記の[「Rust × ESP32」で始める組み込み開発：Lチカまでの完全セットアップガイド](https://developer.mamezou-tech.com/blogs/2025/05/19/using-rust-02/)を参考にセットアップしておく

## ツールのインストール

    cargo install espup --locked
    espup install --targets esp32

終わると、. /home/shanai/export-esp.shを実行するように言われる。中身はこんな感じだった。

    export LIBCLANG_PATH="/home/shanai/.rustup/toolchains/esp/xtensa-esp32-elf-clang/esp-20.1.1_20250829/esp-clang/lib"
    export PATH="/home/shanai/.rustup/toolchains/esp/xtensa-esp-elf/esp-15.2.0_20250920/xtensa-esp-elf/bin:$PATH"

自分はfish shellを使っているので~/.config/fish/config.fish の最後に以下を追加した。

    set -x LIBCLANG_PATH $HOME/.rustup/toolchains/esp/xtensa-esp32-elf-clang/esp-20.1.1_20250829/esp-clang/lib
    set -x PATH $HOME/.rustup/toolchains/esp/xtensa-esp-elf/esp-15.2.0_20250920/xtensa-esp-elf/bin $PATH

rustup showを実行して以下のようにespが追加されていることを確認する。

```
Default host: x86_64-unknown-linux-gnu
rustup home:  /home/shanai/.rustup

installed toolchains
--------------------
stable-x86_64-unknown-linux-gnu (active, default)
nightly-2025-01-01-x86_64-unknown-linux-gnu
esp
...
```

続いて関連するツールをインストール。

```
cargo install espflash
cargo install ldproxy
cargo install cargo-generate
cargo install cargo-espflash
```

## テンプレートから雛形を作る

cargo newのかわりにテンプレートからアプリケーションの雛形を作る

    cargo generate --git https://github.com/esp-rs/esp-idf-template cargo

対話形式でプロジェクト名とesp32のchipを聞かれる。ESP8684は、esp32c2だった。これはespflash board-infoを使うと分かる。

```
$ espflash board-info
[2025-12-21T04:58:26Z INFO ] Serial port: '/dev/ttyUSB0'
[2025-12-21T04:58:26Z INFO ] Connecting...
[2025-12-21T04:58:26Z INFO ] Using flash stub
Chip type:         esp32c2 (revision v2.0)
Crystal frequency: 26 MHz
Flash size:        4MB
Features:          WiFi, BLE
```

プロジェクト名と同一の名前のディレクトリが出来る。中はこんな感じ

```
$ tree blink
blink
├── Cargo.toml
├── build.rs
├── rust-toolchain.toml
├── sdkconfig.defaults
└── src
    └── main.rs
```

上のespflash board-infoを見るとクロックが26 MHzになっており、これは特殊なようだ(通常は40MHzみたい)。このためsdkconfig.defaultsの最後に以下を追加する。

```
CONFIG_XTAL_FREQ_26=y
CONFIG_XTAL_FREQ_SEL_26=y
CONFIG_XTAL_FREQ=26
```

本当はこのうちどれかで良いらしいが、どうもツールのバージョンで名前が変わっているらしく、とりあえず全部書いておけばどれか当たるらしい。

> ⚠ **Warning:** クロック指定をしないとこの後の実行で以下のようなエラーになる
>     (337) cpu_start: Unicore app                                     
>                                                                                                                                           
>    assert failed: esp_clk_init clk.c:81 (rtc_clk_xtal_freq_get() == CONFIG_XTAL_FREQ)                                                     
>    Core  0 register dump:                                             
>    MEPC    : 0x40381172  RA      : 0x40383bc6  SP      : 0x3fcde490  GP      : 0x3fca97c0              
>    0x40381172 - panic_abort                                           
>        at /home/shanai/esp32/blink/.embuild/espressif/esp-idf/v5.3.3/components/esp_system/panic.c:463                                    
>    0x40383bc6 - __ubsan_include                                                                                                           
>        at /home/shanai/esp32/blink/.embuild/espressif/esp-idf/v5.3.3/components/esp_system/ubsan.c:311                                    
>    0x3fca97c0 - s_fd_table                                                                                                                
>        at ??:??                                                                                                                           
>    TP      : 0x00000000  T0      : 0x37363534  T1      : 0x7271706f  T2      : 0x33323130                         
>    S0/FP   : 0x00000001  S1      : 0x3fcde602  A0      : 0x3fcde4e8  A1      : 0x3fcaa141  
>    A2      : 0x00000001  A3      : 0x00000029  A4      : 0x00000001  A5      : 0x3fcab000  
>    0x3fcab000 - xIsrStack

あと、どうも生成される雛形はsdkconfig.defaultsを読んでくれないみたいなので、Cargo.tomlの最後に以下を追加しておく。

```
[package.metadata.esp-idf-sys]
esp_idf_sdkconfig_defaults = ["sdkconfig.defaults"]
```

## フラッシュ、実行

cargo runでフラッシュ、実行を開始してシリアルコンソールの内容が表示される。

```
$ cargo run
...
I (499) sleep: Enable automatic switching of GPIO sleep configuration
I (510) main_task: Started on CPU0
I (510) main_task: Calling app_main()
I (520) blink: Hello, world!
I (520) main_task: Returned from app_main()
```

Hello, world!が表示されるのが分かる。これはmain.rsが以下のようになっているため。

```rust
fn main() {
    // It is necessary to call this function once. Otherwise, some patches to the runtime
    // implemented by esp-idf-sys might not link properly. See https://github.com/esp-rs/esp-idf-template/issues/71
    esp_idf_svc::sys::link_patches();

    // Bind the log crate to the ESP Logging facilities
    esp_idf_svc::log::EspLogger::initialize_default();

    log::info!("Hello, world!");
}
```

Lチカは、こんな感じにmain.rsを変更してやれば良い。このコードではgpio4がブリンクする。。

```rust
use esp_idf_svc::{
  hal::{gpio::PinDriver, peripherals::Peripherals},
  sys::link_patches,
  log::EspLogger,
};
use std::{
  thread::sleep, 
  time::Duration
};

fn main() -> std::result::Result<(), esp_idf_svc::sys::EspError> {
    link_patches();
  
    EspLogger::initialize_default();
  
    let peripherals = Peripherals::take().unwrap();

    let mut led = PinDriver::output(peripherals.pins.gpio4)?;

    loop {
        led.set_high()?; // 点灯
        sleep(Duration::from_millis(500));

        led.set_low()?; // 消灯
        sleep(Duration::from_millis(500));
    }

    #[allow(unreachable_code)]
    panic!();
}
```

なおシリアルポートは自動検出されるみたいだが、自動検出がうまくいかない場合は.cargo/config.tomlの以下で行うらしい(自分のところでは自動検出でうまくいったので未検証)。

```
[target.riscv32imc-esp-espidf]
linker = "ldproxy"
runner = "espflash flash --monitor --port /dev/ttyUSB1"
```

なおUSBシリアルのデバイス名を調べるには以下のコマンドを実行すると良い。

```
ls -l /dev/serial/by-id

合計 0
lrwxrwxrwx 1 root root 13 12月 21 13:58 usb-Silicon_Labs_CP2102N_USB_to_UART_Bridge_Controller_7e717248f66def118448e9c2c169b110-if00-port0 -> ../../ttyUSB0
```

単体テストを書くと、cargo testもESP32で実行しようとするので、ハードウェアに関係しないロジックは別クレートに分けて、dependenciesに指定する方が良さそうだ。
