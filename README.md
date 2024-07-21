# GIM Buddy Server

_0.1.0-alpha.1_

**GIM Buddy Server** is currently in alpha development stage. As such, you may encounter bugs and incomplete features. Your feedback is invaluable to us as we continue to improve and enhance the plugin.

How to Report Bugs
If you encounter any issues or have suggestions for improvements, please report them by opening an issue on our GitHub repository. We appreciate your patience and support as we work towards delivering a stable and feature-complete plugin.

We are committed to making constant improvements to GIM Buddy. Stay tuned for regular updates that will bring new features, optimizations, and bug fixes.

## Prerequisites

- [Node.js (v14 or later)](https://nodejs.org/)
- [npm (v6 or later)](https://www.npmjs.com/)
- [Firebase Service Account](https://firebase.google.com/)

##### Firebase Firestore offers a simple quick option for a No-Sql DB at no cost. Simply setup a firestore service account, grab your json credentials, run the server login and the db will setup itself once first sync has completed.

_Free Tier (Spark Plan) does have limitations on read, writes, and deletes and can upgrade db if need [very unlikely] - optimizations to how and how often we sync with the db will be release in future versions to help cut down on read, write, deletes_

## Setup

1. **Clone the repository:**

   ```sh
   git clone https://github.com/fNudz/gim-buddy-server.git
   cd gimbuddy-server
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Configure Firebase:**

   #### _NOTE - This key will give anyone access to your firestore db, please protect your key at all cost._

   - Obtain your `firebase-adminsdk.json` credential file from the Firebase Console.

   - Place the `firebase-adminsdk.json` file in the `config/firestore/` directory.

     ```sh
     cp .env-sample .env
     ```

     - Fill in ENV variables found in firebase-sdk.json for what is needed in .env

4. **Run the server:**

   ```sh
   npm start
   ```

   The server will start and listen on `http://localhost:5000`.

## Running with Docker

If you prefer to run the server in a Docker container, follow these steps:

1. **Add your Firebase credential:**

   - Ensure your `firebase-adminsdk.json` credential file is in the `config/firestore/` directory as described above.

2. **Build the Docker image:**

   ```sh
   docker build -t gim-buddy-server .
   ```

3. **Run the Docker container:**

   ```sh
   docker run -d -p 5000:5000 --name gimbuddy-server gimbuddy-server
   ```

   The server will be available at `http://localhost:5000`.

## Notes

- Each user can run their unique instance of the server as long as the Firebase service account credentials point to the same service account.
- While Docker deployment is optional, it allows for easier deployment to cloud resources if desired.

## Contributing

If you encounter issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
