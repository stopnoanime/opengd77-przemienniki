import { xml2js } from 'xml-js'
import fetch from 'node-fetch';
import { stringify } from 'csv-stringify/sync';
import { writeFileSync } from 'fs';
import { program } from "commander";

program
    .name('opengd77-przemienniki')
    .description('Fetches specified repeaters from przemienniki.net and exports them to a OpenGD77 compatible CSV')
    .argument('<callsigns...>', 'Callsigns of repeaters to export')
    .option('-o, --output <file>', 'File that the CSV will be saved in, default is Channels.csv')
    .option('-t, --talkgroup <tg>', `Talkgroup list to set in DMR Channels, default is 'Brandmeister'`)
    .option('-p, --pmr', 'Add PMR Channels 1-16 to export');

program.parse();

//Setup arguments
const repeaterNames = program.args;
const addPMR = !!program.opts().pmr;
const DMRTg = program.opts().talkgroup || 'Brandmeister';
const outputFileName = program.opts().output || 'Channels.csv';

//Fetch data
const przemiennikiXML = await (await fetch('https://przemienniki.net/export/rxf.xml?source=all&onlyworking=true')).text();
const przemiennikiJS: any = xml2js(przemiennikiXML, {compact: true, alwaysArray: true});

//Create array of repeaters that match criteria
const repeaterArray = 
    (przemiennikiJS.rxf[0].repeaters[0].repeater as any[])
    .filter(r => repeaterNames.includes(r.qra[0]._text[0]))
    .flatMap(r => {
        const rxQrg = r.qrg.find(qrg => qrg._attributes.type == 'rx')._text[0] as string;
        const txQrg = r.qrg.find(qrg => qrg._attributes.type == 'tx')._text[0] as string;

        const txCtcss = r.ctcss?.find(ctcss => ctcss._attributes.type == 'rx')._text[0] as string || 'None';

        const modes = r.mode.filter(m => ['FM', 'MOTOTRBO'].includes(m._text[0])) as any[];

        //If a repeater supports both DMR and FM, make two separate entries for it
        return modes.map(m => {
            const digital = m._text[0] == 'MOTOTRBO';

            return {
                nr: 0,

                name: r.qra[0]._text[0] as string,
                band: r.band[0]._text[0] as string,
                type: digital ? 'Digital' : 'Analogue',
                rxFreq: txQrg,
                txFreq: rxQrg,
                
                //DMR properties:
                ...(digital && {
                    cc: 1,
                    ts: 1,
                    contact: 'None',
                    tgList: DMRTg,
                    dmrId: 'None',
                    TS1_TA_Tx: 'Off',
                    TS2_TA_Tx_ID: 'Off',
                }),
                
                //FM properties:
                ...(!digital && {
                    bandwidth: 12.5,
                    txTone: txCtcss,
                    rxTone: 'None',
                    squelch: 'Disabled',
                }),

                //Common hardcoded properties
                power: 'Master',
                rxOnly: 'No',
                zoneSkip: 'No',
                allSkip: 'No',
                TOT: 0,
                VOX: 'Off',
                noBeep: 'No',
                noEco: 'No',
            }
        })
    })

//Sort the repeaters by MODE-BAND-CALLSIGN
repeaterArray.sort((a,b) => b.type.localeCompare(a.type) || a.band.localeCompare(b.band) || a.name.localeCompare(b.name));

//Add PMR if requested
if(addPMR) repeaterArray.push(...[...Array(16)].map((_, i) => ({
    nr: 0,

    name: 'PMR' + (i + 1),
    type: 'Analogue',
    rxFreq: (446.00625 + i * 0.0125).toPrecision(9),
    txFreq: (446.00625 + i * 0.0125).toPrecision(9),

    band: '',
    bandwidth: 12.5,
    txTone: 'None',
    rxTone: 'None',
    squelch: 'Disabled',
    power: 'Master',
    rxOnly: 'No',
    zoneSkip: 'No',
    allSkip: 'No',
    TOT: 0,
    VOX: 'Off',
    noBeep: 'No',
    noEco: 'No',
} as any)))

//Number the entries
let index = 1;
repeaterArray.forEach(r => r.nr = index++);

//Convert to csv
const outputCSV = stringify(
    repeaterArray, 
{
    header: true,
    columns: [ 
        { key: 'nr', header: 'Channel Number' },
        { key: 'name', header: 'Channel Name' },
        { key: 'type', header: 'Channel Type' },
        { key: 'rxFreq', header: 'Rx Frequency' },
        { key: 'txFreq', header: 'Tx Frequency' },
        { key: 'bandwidth', header: 'Bandwidth' },
        { key: 'cc', header: 'Colour Code' },
        { key: 'ts', header: 'Timeslot' },
        { key: 'contact', header: 'Contact' },
        { key: 'tgList', header: 'TG List' },
        { key: 'dmrId', header: 'DMR ID' },
        { key: 'TS1_TA_Tx', header: 'TS1_TA_Tx' },
        { key: 'TS2_TA_Tx_ID', header: 'TS2_TA_Tx ID' },
        { key: 'rxTone', header: 'RX Tone' },
        { key: 'txTone', header: 'TX Tone' },
        { key: 'squelch', header: 'Squelch' },
        { key: 'power', header: 'Power' },
        { key: 'rxOnly', header: 'Rx Only' },
        { key: 'zoneSkip', header: 'Zone Skip' },
        { key: 'allSkip', header: 'All Skip' },
        { key: 'TOT', header: 'TOT' },
        { key: 'VOX', header: 'VOX' },
        { key: 'noBeep', header: 'No Beep' },
        { key: 'noEco', header: 'No Eco' },
    ]
});

//Write to file
writeFileSync(outputFileName, outputCSV);

console.log(`Successfully exported ${repeaterArray.length} channels.`);