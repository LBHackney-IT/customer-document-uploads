module.exports = () => {
  function write(level, message, data) {
    console.log(
      JSON.stringify(
        {
          level,
          datetime: new Date(Date.now()).toISOString(),
          message,
          data: { ...data }
        },
        undefined,
        2
      )
    );
  }

  const info = (message, data) => write('INFO', message, data);
  const error = (message, data) => write('ERROR', message, data);

  return { info, error };
};
