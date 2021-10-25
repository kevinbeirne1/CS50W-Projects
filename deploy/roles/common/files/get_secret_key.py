import re
import sys
from pathlib import Path

import environ
from django.core.management.utils import get_random_secret_key


def check_for_existing_django_secret_key_and_create_new_one_if_needed():
    env = environ.Env(SECRET_KEY=(str, get_random_secret_key()))

    search_path = sys.argv[1]
    environ.Env.read_env(Path(search_path) / ".env")

    secret_key = env('SECRET_KEY')

    # try:
    #     dotenv.load_dotenv(search_path)
    #     secret_key = os.environ['SECRET_KEY']
    #     match = re.match(r'^\S{50}$', secret_key)
    #     if not match:
    #         secret_key = new_secret_key
    # except KeyError:
    #     secret_key = new_secret_key

    print( f"SECRET_KEY={secret_key}")


if __name__ == "__main__":
    print(f"SECRET_KEY={get_random_secret_key()}")
    # check_for_existing_django_secret_key_and_create_new_one_if_needed()
