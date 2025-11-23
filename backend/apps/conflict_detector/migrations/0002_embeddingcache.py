# Generated manually for pgvector support

from django.contrib.postgres.operations import CreateExtension
from django.db import migrations, models
import pgvector.django


class Migration(migrations.Migration):

    dependencies = [
        ("conflict_detector", "0001_initial"),
    ]

    operations = [
        # Enable pgvector extension
        CreateExtension("vector"),
        # Create EmbeddingCache model
        migrations.CreateModel(
            name="EmbeddingCache",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "text_hash",
                    models.CharField(
                        db_index=True,
                        help_text="Hash SHA256 del texto original",
                        max_length=64,
                        unique=True,
                    ),
                ),
                (
                    "embedding",
                    pgvector.django.VectorField(
                        dimensions=1536,
                        help_text="Vector de embedding generado por OpenAI",
                    ),
                ),
                (
                    "model_name",
                    models.CharField(
                        default="text-embedding-3-small",
                        help_text="Nombre del modelo de embedding utilizado",
                        max_length=100,
                    ),
                ),
                (
                    "dimension",
                    models.IntegerField(
                        default=1536,
                        help_text="Dimensión del vector de embedding",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Embedding Cache",
                "verbose_name_plural": "Embedding Caches",
                "db_table": "conflict_detector_embedding_cache",
            },
        ),
        migrations.AddIndex(
            model_name="embeddingcache",
            index=models.Index(
                fields=["text_hash", "model_name"],
                name="conflict_de_text_ha_a8b9c5_idx",
            ),
        ),
    ]

