+++
date ="2025-12-14"
title = "石油ファンヒータの自動offを防ぐ"
+++

[ESP32で音声を記録して、FFTする](/blog/esp32-fft/)の続き。また石油ファンヒータの季節になったので、自動offの時に石油ファンヒータが鳴らすアラームをiPhoneのボイスメモで録音した。

<audio controls>
    <source src="alarm.m4a" type="audio/mp4">
</audio>

こいつをFFTを使って検出すれば良い。この前のFFTのプログラムを少し変更する。

```c++
// -*- mode: c++ -*-

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_system.h"
#include "driver/spi_master.h"
#include "soc/gpio_struct.h"
#include "driver/gpio.h"
#include "driver/uart.h"
#include "soc/uart_struct.h"
#include <math.h>

#include "esp_dsp.h"

#define SAMPLING_FREQUENCY 10000
unsigned int sampling_period_us = 1000L * 1000L / SAMPLING_FREQUENCY;

#define N_SAMPLES 1024
int N = N_SAMPLES;
// Input test array
__attribute__((aligned(16)))
float x1[N_SAMPLES];
// Window coefficients
__attribute__((aligned(16)))
float wind[N_SAMPLES];
// working complex array
__attribute__((aligned(16)))
float y_cf[N_SAMPLES * 2];

void setup() {
  pinMode(32, ANALOG);
  Serial.begin(115200);
}

void loop() {
  esp_err_t ret = dsps_fft2r_init_fc32(NULL, CONFIG_DSP_MAX_FFT_SIZE);
  if (ret != ESP_OK) {
    Serial.printf("Not possible to initialize FFT. Error = %i", ret);
    return;
  }

  dsps_wind_hann_f32(wind, N); // Generate hann window
  //  dsps_tone_gen_f32(x1, N, 1.0, 0.16, 0); // Generate input signal: A=1.0, F=0.16

  float ave = 0;
  for (int i = 0; i < N; ++i) {
    unsigned long t = micros();
    int a = analogRead(32);
    while ((micros() - t) < sampling_period_us) ;
    x1[i] = a;
    ave += a;
  }

  ave /= N;
  for (int i = 0; i < N; ++i) {
    x1[i] = x1[i] - ave;
  }

  for (int i = 0 ; i < N ; i++) {
    y_cf[i * 2 + 0] = x1[i] * wind[i];  // 実部
    y_cf[i * 2 + 1] = 0.0;              // 虚部は0
  }

  dsps_fft2r_fc32(y_cf, N); // FFT
  dsps_bit_rev_fc32(y_cf, N); // Bit reverse

  float max = 0.0;
  int maxIdx = -1;
  for (int i = 0 ; i < N / 2 ; i++) {
    float real = y_cf[i * 2 + 0];
    float imag = y_cf[i * 2 + 1];
    float power = (real * real + imag * imag) / N;
    y_cf[i] = 10 * log10f(power);  // dB変換
    if (max < y_cf[i]) {
      max = y_cf[i];
      maxIdx = i;
    }
  }

// Show power spectrum
//  dsps_view(y_cf, N / 2, 64, 10, -60, 40, '|');
  
  Serial.printf("Max: %d\r\n", maxIdx);
  delay(50);
}
```

FFT変換した後、スペクトラムが最大となるX軸の値を表示するようにした。この状態で、さきほどの音を聞かせてやるとシリアルコンソールにこのように表示される。

```
...
17:35:22.740 -> Max: 390
17:35:22.901 -> Max: 410
17:35:23.062 -> Max: 411
17:35:23.221 -> Max: 411
17:35:23.349 -> Max: 411
17:35:23.510 -> Max: 411
17:35:23.670 -> Max: 411
17:35:23.831 -> Max: 285
17:35:23.990 -> Max: 202
17:35:24.151 -> Max: 139
17:35:24.310 -> Max: 353
17:35:24.470 -> Max: 103
17:35:24.598 -> Max: 364
17:35:24.758 -> Max: 411
17:35:24.918 -> Max: 411
17:35:25.079 -> Max: 411
17:35:25.240 -> Max: 411
17:35:25.400 -> Max: 411
17:35:25.561 -> Max: 409
17:35:25.722 -> Max: 256
...
```

アラームが鳴っている間は、だいたいX軸の値が411くらいの値になっており、音がoffの間はランダムな値になっている(周囲の雑音)。A/D変換+FFTと、最後の50msのdelayがループ1回の処理時間だが、鳴っている間、および間の無音部分で、だいたいループが6回分回るようだ。

なので検出アルゴリズムとしては、

- このMAX値を過去18回分保管する
- 最初の6回分のうち5回分は410から412の間である
- 次の6回分のうち5回分は410から412の間にない
- 最後の6回分のうち5回分は410から412の間である

が満たされていれば、このアラームが鳴っていると判断することにする。6回のうち5回にしたのは雑音の影響を考慮したため。さて、こういうちょっと複雑なロジックをテスト無しに書くのは辛い。

Arduino IDEだとxxx.inoというファイル1つしか無いので、GoogleTest使いたいけど、どうやるの？ とAIに聞いてみた。残念ながらイマイチな回答しか得られず終い。しかたないので自分で考える。

- helperというディレクトリを作り、その中にPCでビルドできるGoogleTest環境を作成
- その中に、pattern_finder.cc/pattern_finder.hを作ってやり、上記のロジックを実装
- これらをGoogleTestでテストするpattern_finder_test.ccも作ってやる

で、このpattern_finder.cc/pattern_finder.hを、.inoフィルがあるディレクトリにシンボリックリンクするようにしたらどうか？ と逆にAIに聞いてみると「素晴しいです。理想的な解決方法です」とか言われた。なんか生成AI使うとこういうケースが多いんよねw

あとは[ESP32からSwitchBotにBluetooth接続](/blog/esp32-bt/)を組み合わせて、パターンが見つかったらSwitchBotのボタンを押してやる。

[コード全体](https://github.com/ruimo/heaterKeeper)
