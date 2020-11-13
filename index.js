const express = require('express');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');


const PORT = 8000;
const app = express();

app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('assests'));

app.use('/', require('./routes'))

app.listen(PORT, (err) => {
    if(err) {
        console.log('Error in bringing up the server on port ', PORT);
        return;
    }

    console.log('Server is up and running on port ', PORT);
}); 