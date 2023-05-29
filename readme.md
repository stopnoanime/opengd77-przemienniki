# OpenGD77-przemienniki

A small CLI tool used to export repeater data from [przemienniki.net](https://przemienniki.net) to a OpenGD77 compatible CSV format.

It sorts the repeaters by `MODE (DMR/FM) - BAND - CALLSIGN` in that order.

## Usage
```
# Install
npm i

# Show help
npm start -- -h

# Example
npm start SR9E SR9DKA SR9SS SR9DX SR9DXK SR9ZHP SR9BN SR9DMR SR9DBN SR9GC SR9RSR SR9PS SR9S SR9CSR SR9SC SR9US SR9BSR SR9ZAR SR9ASR SR2BW SR2KU OK0BDL -- --pmr
```