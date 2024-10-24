using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

namespace HQ.Abstractions;
public static class SHA512Extensions
{
    public static string ComputeHashAsString(this SHA512 sha512, byte[] bytes)
    {
        var hashedBytes = sha512.ComputeHash(bytes);

        var hashedInputStringBuilder = new System.Text.StringBuilder(128);
        foreach (var hashedByte in hashedBytes)
        {
            hashedInputStringBuilder.Append(hashedByte.ToString("X2").ToLower());
        }

        return hashedInputStringBuilder.ToString();
    }
}