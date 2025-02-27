# ASTRA Base Station

Welcome! This is the repository for UAH's ASTRA Base Station for the University
Rover Challenge in 2025.

ASTRA is a project under the AutoSat branch of Space Hardware Club as part of
The University of Alabama in Huntsville.

## If you're on basestation and no one is there to help you (I gotchu, McGinnis)

1. Make sure you're on the correct version of this repo AND that vscode isn't
   showing changes for the submodules. `main` for the submodules is not

2. In a new vscode terminal window:

    ```bash
    cd interfaces
    colcon build
    ```

3. In a new vscode terminal window (leave it running!):

    ```bash
    cd backend
    poetry install
    poetry run start
    ```

4. In a new vscode terminal window (leave it running!):

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5. At this point, vite will fill your ears and eyes with LIES AND DECEIT. Do not
   fall for its devilish tricks. Instead of opening some evil port ordained by
   the devil himself, open the only good and holy port: 80. Navigate to
   <http://localhost:80> in your browser and behold basestation in all of its glory.

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
