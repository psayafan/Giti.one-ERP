# Installation

```bash
git clone https://github.com/psayafan/Giti.one-ERP.git
cd Giti.one-ERP
./setup.sh
```

`./setup.sh` installs dependencies, runs tests, starts PostgreSQL when Docker is available, loads the demo, and prints the books.

Persian: `./setup.sh --lang fa`

Local UI: `npm start` then http://127.0.0.1:3847 (this machine only).

If Docker is missing, the same books still print in memory.

Full text: [docs/INSTALL.md](https://github.com/psayafan/Giti.one-ERP/blob/main/docs/INSTALL.md)
