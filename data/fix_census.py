with open('census.json', 'r') as f:
  with open('census2.json', 'w') as f2:
    for line in f:
      print line
      f2.write('%s,' % line)