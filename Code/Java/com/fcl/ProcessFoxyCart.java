package com.fcl;

import java.util.Hashtable;
import java.io.*;
import javax.xml.parsers.*;
import org.w3c.dom.*;
import org.xml.sax.*;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.xpath.*;

import org.apache.commons.codec.net.URLCodec;

public class ProcessFoxyCart {
	public static String getXML(String encoded) throws Exception {
		String password = "FGGYKJvu78NP2xJ8Kk2uyedtSGTxEfbbLIZnmlLpnu4fRHiwSaUheYA2zjp5";

		Cipher rc4 = Cipher.getInstance("RC4");
		rc4.init(Cipher.DECRYPT_MODE, new SecretKeySpec(password.getBytes(),
				"RC4"));

		// need Commons-codec library for this bit!
		byte[] decoded = URLCodec.decodeUrl(encoded.getBytes());

		byte[] decrypted = rc4.doFinal(decoded);

		String xml = new String(decrypted);

		return xml;
	}

	public static Hashtable<String, String> getValues(String xml)
			throws Exception {
		Hashtable<String, String> out = new Hashtable<String, String>();
		Document doc = ProcessFoxyCart.stringToDom(xml);
		XPath xp = XPathFactory.newInstance().newXPath();
		String exp = "foxydata/transactions/transaction/customer_email/text()";
		String maxConnsStr = xp.evaluate(exp, doc);
		out.put("customer_email", maxConnsStr);
		exp = "foxydata/transactions/transaction/customer_first_name/text()";
		maxConnsStr = xp.evaluate(exp, doc);
		out.put("customer_first_name", maxConnsStr);
		exp = "foxydata/transactions/transaction/customer_last_name/text()";
		maxConnsStr = xp.evaluate(exp, doc);
		out.put("customer_last_name", maxConnsStr);
		exp = "foxydata/transactions/transaction/customer_company/text()";
		maxConnsStr = xp.evaluate(exp, doc);
		out.put("customer_company", maxConnsStr);
		return out;
	}

	public static Document stringToDom(String xmlSource) throws SAXException,
		ParserConfigurationException, IOException {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		DocumentBuilder builder = factory.newDocumentBuilder();
		return builder.parse(new InputSource(new StringReader(xmlSource)));
	}
}
