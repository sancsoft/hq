using System;
using System.Collections.Generic;
using System.Reflection;

namespace HQ.Utility.Framework
{
    public class PropertyTools
    {
        public static bool UpdateProperty(Object obj, string name, string value)
        {
            List<PropertyInfo> properties = new List<PropertyInfo>(obj.GetType().GetProperties());
            foreach (PropertyInfo p in properties)
            {
                if (p.Name == name)
                {
                    try
                    {
                        // Convert string values to the property as best we can; enums use one process - 
                        // enum parsing, everything else tries to changetype
                        if (p.PropertyType.IsEnum)
                        {
                            p.SetValue(obj, Enum.Parse(p.PropertyType, value));
                        }
                        else
                        {
                            p.SetValue(obj, Convert.ChangeType(value, p.PropertyType));
                        }
                        return true;
                    }
                    catch (Exception)
                    {
                        Console.WriteLine("Unable to set {0} = {1}", name, value);
                        return false;
                    }
                }
            }
            Console.WriteLine("Property {0} not found", name);
            return false;
        }

        public static bool UpdateProperties(Object obj, string[] propval, int offset)
        {
            bool dirty = false;
            for (int i = offset; i < propval.Length; i += 2)
            {
                if ((i + 1) >= propval.Length)
                {
                    Console.Write("Unmatched property at {0}", i);
                    break;
                }
                if (UpdateProperty(obj, propval[i], propval[i + 1]))
                {
                    dirty = true;
                }
            }
            return dirty;
        }
    }
}
