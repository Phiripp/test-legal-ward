from agents.conflict_detector import run_agent
import json


def main() -> None:
    """Ejecuta el grafo del agente AES Andes usando la nueva estructura."""
    with open('ejemplo_documento.json', 'r') as f:
        document_pages = json.load(f)['pages']
    result = run_agent(document_pages)
    print(result)


if __name__ == '__main__':
    main()
