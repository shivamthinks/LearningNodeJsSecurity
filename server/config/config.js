var env = process.env.NODE_ENV || 'development'; //heroku automaticallu sets process.env.NODE_ENV to production.
                                                 //App is run in three modes:
                                                 //1) development: env is set manually.
                                                 //2) test: env is set manually in process.env.NODE_ENV through package.json.
                                                 //3) production: env is set process.env.NODE_ENV.

//environment variables for development environment
if(env === 'development'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/todoappdev';
}
//environment variables for testing environment
else if(env === 'test'){
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/todoapptest';
}
//environment variables for production environment
else if(env === 'production'){
    process.env.PORT = process.env.PORT; //This is set by heroku to the available port.
    process.env.MONGODB_URI = process.env.MONGODB_URI; //This is set by heroku based on config vars set in heroku config.
}