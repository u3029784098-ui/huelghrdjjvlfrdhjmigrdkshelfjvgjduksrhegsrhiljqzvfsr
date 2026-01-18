
# install nvm if missing
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# reload shell
source ~/.bashrc   # or ~/.zshrc

# install Node 20 LTS
nvm install 20

# use it
nvm use 20

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss-cli@latest init -p
