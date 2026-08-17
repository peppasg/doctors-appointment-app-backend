import app from "./app";
import { connectDB } from "./utils/db";

const start = async() => {
    await connectDB();

app.listen(3001, () => {
    console.log('Server is up');
})
}

start();

