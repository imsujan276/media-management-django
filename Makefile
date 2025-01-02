run:
	python manage.py runserver

migrations:
	python manage.py makemigrations

migrate:
	python manage.py migrate

superuser:
	python manage.py createsuperuser

ngrok:
	ngrok http 8000

freeze:
	pip freeze > requirements.txt

install:
	pip install -r requirements.txt