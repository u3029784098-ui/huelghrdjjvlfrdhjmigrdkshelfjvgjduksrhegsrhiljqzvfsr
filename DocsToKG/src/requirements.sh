sudo apt update
sudo apt install libimage-exiftool-perl
sudo apt install openjdk-21-jdk
pip install pyexiftool
pip install requests lxml mathml2latex
pip install mathml-to-latex
pip install py-asciimath
pip install grobid-client
pip install kreuzberg
apt-get install tesseract-ocr pandoc
pip install --force-reinstall "antlr4-python3-runtime==4.9.3"
pip install transformers==4.38.2 --force-reinstall --break-system-packages
pip install nougat-ocr
pip install "albumentations<1.2.0"
pip install layoutparser
pip install pymupdf
pip install matplotlib
pip3 install 'git+https://github.com/facebookresearch/detectron2.git@v0.4#egg=detectron2'
pip install git+https://github.com/openai/CLIP.git
npm install mathjax-node
pip install ollama --break-system-packages
pip install dspy
pip install pyalex
pip install arxiv
pip install coreapi
pip install SPARQLWrapper
pip install neo4j-graphrag --break-system-packages
pip install graphdatascience --break-system-packages
pip install langchain
pip install langchain-neo4j
pip install langchain-ollama==0.2.2
pip install longchain-core
# In case there is error in Langchain
pip install "langchain<0.4.0" "langchain-core<0.4.0" --break-system-packages
pip install unstructured --break-system-packages
pip install langchain_experimental
pip install wikipedia --break-system-packages
pip install wikipedia-api sentence-transformers --break-system-packages
pip install gradio_client

git clone https://github.com/kermitt2/grobid
cd grobid
./gradlew clean install
./gradlew run
