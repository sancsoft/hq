using System;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Security.Cryptography;
using System.Text;
using System.Text.Unicode;
using System.Threading.Tasks;

using HQ;
using HQ.Abstractions;
using HQ.Abstractions.Common;
using HQ.Abstractions.Enumerations;

using Xunit;
namespace HQ.Tests;

public class SHA512ExtensionTests
{
    [Theory]
    [InlineData("Hello", "3615f80c9d293ed7402687f94b22d58e529b8cc7916f8fac7fddf7fbd5af4cf777d3d795a7a00a16bf7e7f3fb9561ee9baae480da9fe7a18769e71886b03f315")]
    [InlineData("World", "8ea77393a42ab8fa92500fb077a9509cc32bc95e72712efa116edaf2edfae34fbb682efdd6c5dd13c117e08bd4aaef71291d8aace2f890273081d0677c16df0f")]
    [InlineData("Hello World", "2c74fd17edafd80e8447b0d46741ee243b7eb74dd2149a0ab1b9246fb30382f27e853d8585719e0e67cbda0daa8f51671064615d645ae27acb15bfb1447f459b")]
    public void TestComputeHashAsString(string input, string expectedHash)
    {
        var inputBytes = Encoding.UTF8.GetBytes(input);

        using var sha512 = SHA512.Create();
        var hash = sha512.ComputeHashAsString(inputBytes);

        Assert.Equal(expectedHash, hash);
    }
}