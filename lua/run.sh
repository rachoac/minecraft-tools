HOST="localhost"
LABEL=$(cat label.txt)
FILENAME=$1
echo "Sending $FILENAME"
curl -s -X POST "http://$HOST:8080/set/$LABEL/$FILENAME" -H "Content-Type: text/plain" --data-binary "@$1"