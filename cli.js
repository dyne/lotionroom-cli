#!/usr/bin/env node

let connect = require('lotion-connect')
var fs = require('fs');

const read_file = filename => {
  try {
    return fs.readFileSync(filename, 'utf8')
  } catch (e) {
    console.log(`File '${filename}' NOT FOUND!`)
  }
}

const read_json = filename => {
  try {
    return JSON.parse(read_file(filename));
  } catch (e) {
    console.log('malformed JSON. try like this:')
    console.log('{ "foo": "bar" }\n\n\n')
    console.error(e.message);
  }
}

const read_gci = () => {
  try {
    return read_file(".gci")
  } catch (e) {
    console.log('.gci file not found!\n\nIs the node runnig?\n\nAre you in the right folder?')
  }
}


async function main() {
  if (process.argv[2] === 'state' && process.argv.length === 4) {
    let { state } = await connect(process.argv[3])
    console.log(JSON.stringify(await state, null, 2))
    process.exit()
  } else if (process.argv[2] === 'send' && process.argv.length === 6) {
    const gci = read_gci()
    let { send } = await connect(gci)
    try {
      const data = read_json(process.argv[3])
      const keys = read_json(process.argv[4])
      const contract = read_file(process.argv[5])
      let tx = {
        "keys": keys,
        "data": data,
        "contract": contract
      }
      console.log(`Sending a Transaction to ${gci} with the following: \n\n ${JSON.stringify(tx)} \n\n`)
      console.log(JSON.stringify(await send(tx), null, 2))
      process.exit()
    } catch (e) {
      console.log('malformed JSON. try like this:')
      console.log('$ lotion send <gci> \'{ "foo": "bar" }\'')
    }
  } else if (process.argv.length < 3) {
    console.log(
      `
  Usage:

    $ lotion state                                                                    Get the latest state of an app
    $ lotion send <data-filename.json> <keys-filename.json> <zencode-filename.zen>    Send a zencode transaction to a running app
      `
    )
  }
}

main()
