import os
import pandas as pd

# Set up variables
folder_path = "data"
gender_map = {"M": "Male", "F": "Female"}
region_map = {"FLE": "Flanders", "WAL": "Wallonia", "BRU": "Brussels"}
all_data = pd.DataFrame()

# Loop through all files in the folder
for filename in os.listdir(folder_path):
    # Check if the file is an Excel file
    if filename.endswith(".xls") or filename.endswith(".xlsx"):
        # Create the full path to the file
        filepath = os.path.join(folder_path, filename)

        # Extract variables from the filename
        parts = filename.split("-")
        year = parts[0]
        gender = gender_map.get(parts[1], "Unknown")
        region = region_map.get(parts[2], "Unknown")

        # Load the Excel file into a Pandas DataFrame
        df = pd.read_excel(filepath)

        # Rename the columns
        df.columns = ["Code", "Name", "Total", "0 - 5", "5 - 10", "10 - 15", "15 - 20", "20 - 25", "25 - 30", "30 - 35",
              "35 - 40", "40 - 45", "45 - 50", "50 - 55", "55 - 60", "60 - 65", "65 - 70", "70 - 75", "75 - 80", "80 - 85", "> 85"]

        # Remove the rows that do not containg a cancer code
        df = df[df['Code'].str.match('^C\d{2}|^M\w{2}', na=False)]

        # Reshape the DataFrame from wide to long format
        df = pd.melt(df, id_vars=["Code", "Name", "Total"],
                    var_name="Age", value_name="Count")
        
        # Add year, region and gender to each row
        df.insert(0, "Year", year)
        df.insert(1, "Region", region)
        df.insert(2, "Gender", gender)

        # Sort the DataFrame
        df = df.sort_values(by=["Year", "Region", "Gender", "Code", "Age"])

        # Replace missing values with 0
        df = df.replace('-', 0)

        # Remove the Total column
        df = df.drop(columns=["Total"])

        # Convert the Count column to integers
        df["Count"] = df["Count"].astype(int)

        # Add the DataFrame to the all_data DataFrame
        all_data = pd.concat([all_data, df])

        print("Added:", filename)

# Reset the index
all_data = all_data.reset_index(drop=True)

# Save the data to a CSV file
all_data.to_csv("all_data.csv", index=False)

# Get info on merged DataFrame
print(all_data.head())
print(all_data.tail())
print(all_data.info())
print(all_data.describe())
print(all_data.shape)
print(all_data["Year"].unique())
print(all_data["Region"].unique())
