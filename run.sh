#!/bin/sh
set -eu

HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-2000}"
# Bind address and browser-visible URL are different (0.0.0.0 is not a destination).
BASE_URL="${BASE_URL:-http://localhost:$PORT}"
PAGEFIND_STAMP="public/.pagefind-stamp"

build_pagefind() {
    npx --yes pagefind@1.5.2 --site public
    touch "$PAGEFIND_STAMP"
}

has_site_changes() {
    if [ ! -e "$PAGEFIND_STAMP" ]; then
        return 0
    fi

    for path in config.toml content sass static templates themes; do
        if [ -e "$path" ] && find "$path" -type f -newer "$PAGEFIND_STAMP" -print -quit | grep -q .; then
            return 0
        fi
    done
    return 1
}

watch_pagefind() {
    while true; do
        sleep 1
        if has_site_changes; then
            # Give zola serve time to finish writing updated HTML to public/.
            sleep 2
            build_pagefind
        fi
    done
}

zola build --base-url "$BASE_URL"
build_pagefind
watch_pagefind &
WATCH_PID=$!
trap 'kill "$WATCH_PID" 2>/dev/null || true' INT TERM EXIT
zola serve --interface "$HOST" --port "$PORT" --base-url "$BASE_URL" --no-port-append --force --store-html
