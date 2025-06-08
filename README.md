# CricNRR Application

**Overview:** CricNRR is an application designed to calculate the Net Run Rate (NRR) of a cricket team, assisting them in strategizing their performance to improve their position in the points table.

## Description

**CricNRR** allows users to input specific match-related data to determine the margin by which their team must win the next match to achieve a desired position. The application also evaluates whether winning a match will enable the team to reach their desired position in the points table.

### Input Parameters

Users are required to provide the following information:

1. **Your Team**: Name of the team for which the NRR is being calculated.
2. **Opposition Team**: Name of the opposing team.
3. **Match Format**: Specify the number of overs in the match.
4. **Desired Position**: The desired position for your team in the points table.
5. **Toss Result**: Indicate whether your team is batting first or bowling first.
6. **Match Scores**: 
    - Runs scored if batting first.
    - Runs conceded if bowling first.

### Tech Stack Used

The application is developed using the following technologies:

- **Backend**: Node.js
- **Frontend**: React
- **Libraries and Tools**:- Express (Node.js framework)
    - Joi (Validation library)
    - Concurrently (for running multiple commands)
    - Nodemon (for automatic server restarts)
    - Vite (for frontend development)

## Project Setup

To set up the CricNRR project locally, ensure that you have Node.js and Git installed on your machine. Follow these steps:

1. **Navigate to the desired directory** where you want to clone the CricNRR repository using your command line interface (CLI):

```
cd PATH_TO_THE_DIRECTORY
```
2. **Clone the CricNRR repository**:

```
git clone https://github.com/mihirkabra/CricNRR.git
```
3. **Change to the project directory**:

```
cd CricNRR
```
4. **Install top-level dependencies**:

```
npm install
```
5. **Navigate to the backend folder**:

```
cd backend
```
6. **Install backend dependencies**:

```
npm install
```
7. **Return to the project root directory**:

```
cd ..
```
8. **Navigate to the frontend folder**:

```
cd frontend/cricnrr
```
9. **Install frontend dependencies**:

```
npm install
```

**You're done with the setup! Follow along to run the project**

10. **Return to the project root directory**:

```
cd ..
cd ..
```
11. **Run the project**:

```
npm start
```