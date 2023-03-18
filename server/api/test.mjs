async function t() {
  const startTime = Date.now()
  let endTime
  try {
    await Promise.race([
      new Promise((resolve) => {

      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          endTime = Date.now()

          reject()
        }, 2000)
      }),
    ])
  } catch {
    console.log((endTime - startTime) / 1000)
  }
}

t()
