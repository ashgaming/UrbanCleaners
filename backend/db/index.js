const mongoose = require('mongoose');

function connectToDB() {
    mongoose.connect(process.env.DATABASE_URL, {
     //   useNewUrlParser: true,
      //  useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to DB');
    }).catch(err => console.log(err));
    return
}

module.exports = connectToDB;