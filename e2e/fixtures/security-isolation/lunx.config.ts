
    export default {
      plugins: [{
        name: 'test-plugin',
        buildEnd() {
          console.log("SECRET_ENV_VAR=" + this.process.env.SECRET_ENV_VAR);
        }
      }]
    };
  