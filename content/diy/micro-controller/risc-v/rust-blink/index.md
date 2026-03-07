+++
date = "2026-3-7"
title = "CH32V003でRustを使ってLチカ"
+++

以前試した時はうまく動かなかったので、そろそろ熟成されているかなと再度試すことにする。

Google検索して新しそうなものを探すと[これ](https://github.com/albertskog/ch32v003-blinky-rust)が見つかるので、試してみるとあっさり動いた。

WCH-LinkEの設定は[以前書いた通り](https://ruimo.github.io/ch32v003try/)。

コードはシンプルで、rprintln!()というのを使えば、PC側に表示できるのでprintデバッグも可能。

```Rust
#![no_std]
#![no_main]

use hal::delay::Delay;
use hal::gpio::{Level, Output};
use ch32_hal as hal;
use panic_halt as _;
use rtt_target::{rprintln, rtt_init_print};

#[qingke_rt::entry]
fn main() -> ! {
    rtt_init_print!();
    let config = hal::Config::default();

    let peripherals = hal::init(config);

    let mut led = Output::new(peripherals.PD6, Level::Low, Default::default());

    let mut delay = Delay;

    loop {
        led.toggle();
        delay.delay_ms(1000);
        rprintln!("Blink!");
    }
}
```

このくらいのローエンドだとメモリー消費量が気になるわけだが、以下のように.cargo/config.tomlにrustflagsを設定してやればマップファイルを出力できた。

```toml
[target.riscv32ec-unknown-none-elf]
# Use probe-rs for running the project and specify the linker script
runner = "probe-rs run --chip ch32v003"
rustflags = [
  "-C", "link-arg=-Tlink.x",
  "-C", "link-arg=-Map=output.map",
]
```

中を見ると、

```
     VMA      LMA     Size Align Out     In      Symbol
...
    20bf     20bf        1     1         . = ALIGN(4)
20000000     20c0       18     4 .data
...
2000057c     263c        0     1         PROVIDE( _ebss = .)
20000800 20000800        0     1 .stack
```

なので、ROM領域が8383バイト(20bf)、RAM領域が1404バイト(57c)みたいだ。ROMは半分くらい使われていて、RAMは残り600バイト切りという感じ。スタックにも必要だから使えるのは、この半分くらいかな。手持ちのCH32V305FBP6を試してみたが、probe-rsの書き込みで失敗して動かなかった。大分前にいじったきりなので、チップが壊れている可能性も否定できない..

