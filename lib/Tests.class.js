function TestsBatch()
{
}
with(TestsBatch)
{
	prototype.tests=null;
	prototype.numAssertions=0;
	prototype.numFailedAssertions=0;
	prototype.failedAssertions=[];
	prototype.currentTest=null;
	prototype.break=false;
			
	prototype.run=TestsBatch_run;
	prototype.stop=TestsBatch_stop;
	/* Assertion methods*/
	prototype.ASSERT=TestsBatch_ASSERT;
	prototype.ASSERT_TRUE=TestsBatch_ASSERT_TRUE;
	prototype.ASSERT_FALSE=TestsBatch_ASSERT_FALSE;
	prototype.ASSERT_EQUALS=TestsBatch_ASSERT_EQUALS;
}
			
			
function TestsBatch_run()
{
	for(var methodName in this.tests)
	{
		if(typeof(this.tests[methodName])!="function")
		{
			continue;
		}
		this.currentTest=this.tests[methodName];
		this.currentTest();
		if(this.break)
		{
			break;
		}
	}
		
	console.log("Tests: "+this.tests.length);
	console.log("Assertions: "+this.numAssertions);
	console.log("Failed assertions: "+this.numFailedAssertions);
	
	for(var i=0; i<=this.numAssertions; i++)
	{
		if(!this.failedAssertions[i])
		{
			continue;
		}
		
		console.log("Expected: "+this.failedAssertions[i].expected);
		console.log("Received: "+this.failedAssertions[i].received);
		console.log("----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------");
	}
}
function TestsBatch_stop()
{
	this.break=true;
}
function TestsBatch_ASSERT(cond, expectedValue, receivedValue)
{
	this.numAssertions++;
	if(!cond)
	{
		this.numFailedAssertions++;
		this.failedAssertions[this.numAssertions]={"expected": expectedValue, "received" : receivedValue };
	}
}
function TestsBatch_ASSERT_TRUE(receivedValue)
{
	return this.ASSERT(receivedValue==true, true, receivedValue);
}
function TestsBatch_ASSERT_FALSE(receivedValue)
{
	return this.ASSERT(receivedValue==false, false, receivedValue);
}
function TestsBatch_ASSERT_EQUALS(val1, val2)
{
	this.ASSERT(val1==val2, val1, val2);
}