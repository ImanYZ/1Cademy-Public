const shortenNumber = function (number: number, maxPlaces, forcePlaces, forceLetter?: any) {
  number = Number(number);
  forceLetter = forceLetter || false;
  if (forceLetter !== false) {
    return annotate(number, maxPlaces, forcePlaces, forceLetter);
  }
  let abbr = "";
  if (number >= 1e12) {
    abbr = "T";
  } else if (number >= 1e9) {
    abbr = "B";
  } else if (number >= 1e6) {
    abbr = "M";
  } else if (number >= 1e3) {
    abbr = "K";
  }
  return annotate(number, maxPlaces, forcePlaces, abbr);
};

function annotate(number: number, maxPlaces, forcePlaces, abbr: string): string {
  // set places to false to not round
  let rounded: number = 0;
  switch (abbr) {
    case "T":
      rounded = number / 1e12;
      break;
    case "B":
      rounded = number / 1e9;
      break;
    case "M":
      rounded = number / 1e6;
      break;
    case "K":
      rounded = number / 1e3;
      break;
    case "":
      rounded = number;
      break;
  }
  if (maxPlaces !== false) {
    if (("" + rounded).includes("e-")) {
      rounded = 0;
    } else {
      const test = new RegExp("\\.\\d{" + (maxPlaces + 1) + ",}$");
      if (test.test("" + rounded)) {
        rounded = Number(rounded.toFixed(maxPlaces));
      }
    }
  }
  if (forcePlaces !== false) {
    rounded = Number(Number(rounded).toFixed(forcePlaces));
  }
  return rounded + abbr;
}

export default shortenNumber;
