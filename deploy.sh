# Build Angular project
cd app
npm run build
cd ..

# Delete previuos deploy 
sudo pm2 delete all

# Run 
sudo npm start
