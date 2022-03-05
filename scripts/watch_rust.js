const chokidar = require("chokidar");
const { exec } = require("child_process");

console.log("Watching for changings in matico_spec/src")
chokidar
  .watch("./matico_spec/src", { ignoreInitial: true })
  .on("all", (event, path) => {
    console.log("Building wasm spec...");
    exec(
      "cd matico_spec && wasm-pack build --scope maticoapp",
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      }
    );
});
