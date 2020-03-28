const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://nicknackwackpat:Biacxv448!@ds145292.mlab.com:45292/heroku_frkmq98n", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// HTML Routes //

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"))
});

app.get("/exercise", (req, res) => {
    res.sendFile(path.join(__dirname, "public/exercise.html"))
});

app.get("/stats", (req, res) => {
    res.sendFile(path.join(__dirname, "public/stats.html"))
});

// API Routes //

app.get("/api/workouts", (req, res) => {
    db.Workout.find({})
        .then(dbWorkout => {
            console.log(dbWorkout[0].getTotalDuration)
            let processed = dbWorkout.map(workout=>{
                let newWorkout = workout.toJSON({virtuals:true})
                newWorkout.totalDuration = workout.getTotalDuration;
                return newWorkout;
            })
            res.json(processed);
        });
});

app.get("/api/workouts/range", (req, res) => {
    db.Workout.find({})
        .then(dbWorkout => {
            res.json(dbWorkout);
        });
});

app.put("/api/workouts/:id", (req, res) => {
    db.Workout.create(req.body).then(newExercise => {
        console.log(newExercise)
    
        db.Workout.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.params.id) }, {$set:{exercises: req.body}})
            .then(dbWorkout => {
                res.json(dbWorkout);
            });
        });
});

app.post("/api/workouts/", ({ body }, res) => {
    db.Workout.create(body)

        .then(dbWorkout => {
            res.json(dbWorkout);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`);
});