# fold-shifter README

WORK IN PROGRESS - just uploading the rough version for now so folks can peek if they want.

Move the `---` fold up or down in Unison scratch files.

## Features

Take the highest line that starts with`---` in the file and either:
* if they're moving it upwards:
  * if it's already at the top of the file - remove it and any surrounding blank lines
  * otherwise - remove it from where it is and collapse the surrounding blank lines to be only 1 blank line (ie, only a `\n\n`) and go to the next cluster up of at least two consecutive newlines and replace them with `\n\n---\n\n`
* if they're moving it downwards:
  * if it's already at the bottom of the file - remove it and any surrounding blank lines
  * if the next cluster down of at least two consecutive newlines is adjacent to a line that starts with `---` then just remove it and collapse any surrounding blank lines to `\n\n`
  * otherwise - remove it from where it is and collapse the surrounding blank lines to be only 1 blank line (ie, only a `\n\n`) and go to the next cluster down of at least two consecutive newlines and replace them with `\n\n---\n\n`

## Requirements

TODO

## Extension Settings

TODO

## Building

```
npm run compile
vsce package
```

## License

MIT
