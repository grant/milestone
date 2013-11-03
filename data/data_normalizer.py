# -*- coding: utf-8 -*-
import json
import arc_data
import json_blob

j = json.loads(json_blob.json_data)


# Normalizes a value around a target value
def normalize(value, target, alpha):
    return float((1-alpha)*value) + float(alpha*target)



# Queries json blob into dictionary of values + counts
def parse_json(json_blob, keyword):
    sum_count = 0
    result_dict = {}
    for result in json_blob['results']:
        sum_count += 1
        value = result['raw'][keyword]
        if value in result_dict:
            result_dict[value] += 1
        else:
            result_dict[value] = 1
    return result_dict


# Returns new dictionary of top 5 values in input dictionary and total count of all values
# sum_count is the sum of all the counts in the top_values list
def top_values(items_dict, top_num):
    result_dict = {}
    count = 0
    sum_count = 0
    for item in sorted(items_dict, key=items_dict.get, reverse=True):
        if count >= top_num:
            break
        else:
            count += 1
            sum_count += items_dict[item]
            result_dict[item] = items_dict[item]
    return result_dict, sum_count


# Returns list of [values, raw decimals, normalized decimals]
# sum_count is the sum of all the counts in the top_values list
def gen_weighted_list((items_dict, sum_count)):
    result_list = []
    for item in sorted(items_dict, key=items_dict.get, reverse=True):                                                                                    
        decimal = float(items_dict[item])/float(sum_count)
        result_list.append([item, round(decimal,2), round(normalize(decimal, 1, .3),2)])
    return result_list




arc_values = parse_json(j, 'industry')
top_values = top_values(arc_values, 3)
#print gen_weighted_list(top_values)
