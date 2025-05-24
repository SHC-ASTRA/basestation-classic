#!/usr/bin/env python3

import xml.etree.ElementTree as ET
import zipfile
import os
import sys


def extract_paths_from_qgs(qgs_file_content):
    """
    Parses the content of a QGS file (XML) and extracts potential file paths.

    Args:
        qgs_file_content (str): The XML content of the .qgs file.

    Returns:
        list: A list of unique, non-empty file paths found in the QGS file.
    """
    paths = set()
    try:
        root = ET.fromstring(qgs_file_content)

        # Look for datasource elements
        for datasource_element in root.findall(".//datasource"):
            if datasource_element.text:
                path = datasource_element.text.strip()
                if path:  # Ensure path is not empty after stripping
                    paths.add(path)

        # Look for source attributes in layer-tree-layer elements
        # (as seen in your screenshot)
        for layer_element in root.findall(".//layer-tree-layer"):
            source_attr = layer_element.get("source")
            if source_attr:
                path = source_attr.strip()
                if path:  # Ensure path is not empty after stripping
                    paths.add(path)

        # Look for dataSource elements within maplayer elements
        # (common for vector/raster layers)
        for maplayer_datasource_element in root.findall(".//maplayer/dataSource"):
            if maplayer_datasource_element.text:
                path = maplayer_datasource_element.text.strip()
                if path:  # Ensure path is not empty after stripping
                    paths.add(path)

        # Note: <custom-order><item> elements usually contain layer IDs,
        # not direct file paths. The actual file paths for these layers
        # would be in their corresponding <maplayer><dataSource> definitions.

    except ET.ParseError as e:
        print(f"Error parsing XML: {e}", file=sys.stderr)
    return list(paths)


def get_required_files(project_file_path):
    """
    Parses a QGIS project file (.qgs or .qgz) and determines required file paths.

    Args:
        project_file_path (str): The path to the .qgs or .qgz file.

    Returns:
        list: A list of unique file paths found, or None if a critical error occurs
              (e.g., parsing error, .qgs not found in .qgz).
    """
    required_paths = []
    file_extension = os.path.splitext(project_file_path)[1].lower()

    try:
        if file_extension == ".qgs":
            with open(project_file_path, "r", encoding="utf-8") as f:
                qgs_content = f.read()
            required_paths = extract_paths_from_qgs(qgs_content)
        elif file_extension == ".qgz":
            with zipfile.ZipFile(project_file_path, "r") as zf:
                qgs_file_name_in_zip = None
                project_basename = os.path.splitext(
                    os.path.basename(project_file_path)
                )[0]

                # Try to find a .qgs file matching the project name first
                potential_qgs_name = f"{project_basename}.qgs"
                if potential_qgs_name in zf.namelist():
                    qgs_file_name_in_zip = potential_qgs_name
                else:
                    # Fallback: find the first .qgs file
                    for name in zf.namelist():
                        if name.lower().endswith(".qgs"):
                            qgs_file_name_in_zip = name
                            break

                if qgs_file_name_in_zip:
                    qgs_content = zf.read(qgs_file_name_in_zip).decode("utf-8")
                    required_paths = extract_paths_from_qgs(qgs_content)
                else:
                    print(
                        f"Error: No .qgs file found within {project_file_path}",
                        file=sys.stderr,
                    )
                    return None  # Indicate error
        else:
            # This should ideally be caught before calling this function
            print(
                f"Error: Unsupported file type: {file_extension}. Expected .qgs or .qgz.",
                file=sys.stderr,
            )
            return None  # Indicate error

    except FileNotFoundError:  # Should be caught by pre-check, but good to have
        print(f"Error: Project file not found at {project_file_path}", file=sys.stderr)
        return None
    except Exception as e:
        print(
            f"An error occurred while processing {project_file_path}: {e}",
            file=sys.stderr,
        )
        return None  # Indicate error

    return required_paths


if __name__ == "__main__":
    # You would typically get this from command line arguments
    # For this example, using the filename from your screenshot.
    qgis_project_file_arg = "utah.qgs"
    # To test with a .qgz, you would change this to e.g., "utah.qgz"

    # --- Exit code 1: if the qgs/qgz project file doesn't exist ---
    if not os.path.exists(qgis_project_file_arg):
        print(
            f"Error: Project file '{qgis_project_file_arg}' not found.",
            file=sys.stderr,
        )
        sys.exit(1)

    file_extension = os.path.splitext(qgis_project_file_arg)[1].lower()
    if file_extension not in [".qgs", ".qgz"]:
        print(
            f"Error: Unsupported project file extension '{file_extension}'. Must be .qgs or .qgz.",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Parsing project file: {qgis_project_file_arg}")
    extracted_file_paths = get_required_files(qgis_project_file_arg)

    if extracted_file_paths is None:
        # get_required_files already printed an error to stderr
        print(
            "Failed to extract paths from the project file due to an earlier error.",
            file=sys.stderr,
        )
        # Exit with a general error code, could be different from 1 if needed
        sys.exit(1)  # Or a new code like 3 for "parsing/internal error"

    if not extracted_file_paths:
        print("No file paths were found in the project file.")
        # If no files are referenced, it's a valid state.
        print("Successfully processed: No external file paths to check.")
        sys.exit(0)

    print("\nFound potential required file paths from QGIS project:")
    for path in extracted_file_paths:
        print(f"- {path}")

    # --- Iterate over the files and determine if they exist ---
    # --- If any file doesn't exist, exit code 2 ---
    project_file_directory = os.path.dirname(os.path.abspath(qgis_project_file_arg))

    print("\nChecking existence of referenced files...")
    any_file_missing = False
    for path_from_qgs in extracted_file_paths:
        # QGIS paths can include parameters after a pipe or other characters,
        # e.g., "path/to/file.shp|layername=foo" or "PG:dbname=... table=..."
        # For basic file existence, we often only need the part before the first pipe.
        # For more complex sources (like databases), this check might not be sufficient
        # or relevant in the same way.

        # A simple approach for file-based paths:
        actual_file_to_check = path_from_qgs.split("|")[0]

        if not actual_file_to_check.strip():  # Skip if the path part is empty
            continue

        # Heuristic: If it looks like a URI scheme (e.g., http:, ftp:, PG:), it's not a simple local file path.
        # os.path.exists will likely be false. For this script, we'll treat them as paths to check.
        # A more sophisticated check could try to identify and skip URLs or database connection strings.

        if os.path.isabs(actual_file_to_check):
            resolved_path = actual_file_to_check
        else:
            # Relative paths are typically relative to the QGIS project file
            resolved_path = os.path.join(project_file_directory, actual_file_to_check)

        # Normalize the path (e.g., handles ../, ./)
        resolved_path = os.path.normpath(resolved_path)

        print(f"- '{resolved_path}'", end=" ")
        if not os.path.exists(resolved_path):
            print("❌")
            print(
                f"""\
Error: Referenced file/directory does not exist: '{resolved_path}'

Download the maps by running the command `download-maps` in a terminal tab.""",
                file=sys.stderr,
            )
            any_file_missing = True
            # Requirement: exit if *any* file doesn't exist
            sys.exit(2)
        print("✅")

    # If the loop completes and we haven't exited, all files exist
    print("\nAll referenced files/directories exist.")
    sys.exit(0)  # Explicitly exit with 0 for success
