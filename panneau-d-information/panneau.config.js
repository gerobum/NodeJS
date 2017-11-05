module.exports = {
  apps : [{
    name        : "panneau",
    script      : "./main.js",
    watch       : true,
    ignore_watch : ["node_modules", "lfutur", "lperm"],
    env: {
      hostname: "localhost"
    }
  }]
};
