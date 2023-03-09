function parse(argStr) {
  const keyPairs = argStr.split('&');
  return keyPairs.reduce((prev, keypair) => {
    const [key, value] = keypair.split('=');
    // eslint-disable-next-line no-param-reassign
    prev[key] = value || '';
    return prev;
  }, {});
}

console.log(parse(process.argv[2] || ''));
