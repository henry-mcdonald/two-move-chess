docker build . -t henry/nodechess
docker tag henry/nodechess registry.heroku.com/chess-engine-henry/web
docker push registry.heroku.com/chess-engine-henry/web
heroku container:release web --app chess-engine-henry