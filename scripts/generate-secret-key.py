#!/usr/bin/env python3
"""
Generate a Django SECRET_KEY for production use.
Usage: python scripts/generate-secret-key.py
"""

from django.core.management.utils import get_random_secret_key

if __name__ == "__main__":
    secret_key = get_random_secret_key()
    print("=" * 70)
    print("Django SECRET_KEY generated successfully!")
    print("=" * 70)
    print()
    print("Copy this value to Railway's DJANGO_SECRET_KEY variable:")
    print()
    print(secret_key)
    print()
    print("=" * 70)
    print("IMPORTANT: Keep this secret! Never commit it to git.")
    print("=" * 70)
