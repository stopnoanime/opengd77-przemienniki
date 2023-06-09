# OpenGD77-przemienniki

A small CLI tool used to export repeater data from [przemienniki.net](https://przemienniki.net) to a OpenGD77 compatible CSV format.

It sorts the repeaters by `MODE (DMR/FM) - BAND - CALLSIGN` in that order.

## Help Screen
```
Usage: opengd77-przemienniki [options] <callsigns...>

Fetches specified repeaters from przemienniki.net and exports them to a OpenGD77 compatible CSV

Arguments:
  callsigns             Callsigns of repeaters to export

Options:
  -o, --output <file>   File that the CSV will be saved in, default is Channels.csv
  -t, --talkgroup <tg>  Talkgroup list to set in DMR Channels, default is 'Brandmeister'
  -p, --pmr             Add PMR Channels 1-16 to export
  -h, --help            display help for command
```

## Usage examples
```
# Install
npm i

# Show help
npm start -- -h

# Examples:

npm start SR9E SR9DKA SR9SS SR9DX SR9DXK SR9ZHP SR9BN SR9DMR SR9DBN SR9GC SR9RSR SR9PS SR9S SR9CSR SR9SC SR9US SR9BSR SR9ZAR SR9ASR SR2BW SR2KU OK0BDL -- --pmr

npm start SR9E SR9DKA -- -o output.csv
```

## Importing the generated CSV file
After generating the CSV (default name is `Channels.csv`), go to OpenGD77 CPS and under `File -> CSV` click `Import from CSV` or `Append from CSV`, 
select the folder where the generated CSV is located and click OK. Your channels will be replaced/appended by the ones in the CSV.
