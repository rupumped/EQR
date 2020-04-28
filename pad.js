// From: https://stackoverflow.com/a/10073788/8968816
function pad(n, width) {
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}