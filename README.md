# ASTRA Base Station

Welcome! This is the repository for UAH's ASTRA Base Station for the University
Rover Challenge in 2025.

ASTRA is a project under the AutoSat branch of Space Hardware Club as part of
The University of Alabama in Huntsville.

## If you're on basestation and no one is there to help you

These instructions are for:

- People learning to use arm.
- People learning to use core.
- McGinnis that time Riley slept in too long during SAR filming.

1. Make sure you're on the correct version of this repo AND that vscode isn't
   showing changes for the submodules. You want to be on `main` for everything
   unless Riley tells you otherwise.

2. Build the ros interfaces if you haven't already.

    ```bash
    cd backend/interfaces
    colcon build
    ```

3. Use a new terminal instance for this to ensure you have the latest build
   interfaces. Use these commands to run the backend:

    ```bash
    cd backend
    uv run start
    ```

4. Finally, use these commands to run the frontend:

    ```bash
    cd frontend
    npm install # you only need this command the first time you run Base Station
    npm run dev
    ```

5. At this point, Vite will fill your ears and eyes with LIES AND DECEIT. Do not
   fall for its devilish tricks. Instead of opening some evil port ordained by
   the devil himself, open the only good and holy port: 443. Navigate to
   <https://localhost> in your browser and behold basestation in all of its glory.
   You may have to dismiss a warning to view the page. Click advanced and then
   visit the site anyways.

## Getting Started

1. [Set up your development environment](./docs/setup.md)
2. [Run Basestation](./docs/running.md)
3. [Development scripts](./docs/misc_scripts.md)

## Contributors

For anyone adding to this repository, please add your name to the README before
making a pull request.

- Jamie Roberson
- Alexander Resurreccion
- Anshika Sinha
- Riley McLain
- Roald Schaum
