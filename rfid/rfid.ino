/*******************************************
 * function:get the id of RFID key
 * RFID                    SunFounder Uno
 * VCC                        3.3V
 * RST                        6
 * GND                        GND
 * MISO                       x
 * MOSI                       5
 * SCK                        4
 * SDA                        3
 * IRQ                        2
 ****************************************/

 /**
  * 3 - 4 - 5 - x - 2 - GND - 6 - 3.3
  */

#include"rfid1.h"
RFID1 rfid;//create a variable type of RFID1

uchar serNum[5];  // array to store your ID

void setup()
{
  Serial.begin(9600); //initialize the serial
}
void loop()
{
  checkRFID(0);
  checkRFID(1);
  checkRFID(2);
  checkRFID(3);
  //checkRFID(4);
}

void checkRFID(int i){
  Serial.print(i);
  Serial.print("  ");
  //rfid.begin(IRQ_PIN,SCK_PIN,MOSI_PIN,MISO_PIN,SDA_PIN,RST_PIN)
  if(i==0){
    rfid.begin(2,4,5,7,3,6);
  }
  if(i==1){
    rfid.begin(2,4,5,8,3,6);
  }
  if(i==2){
    rfid.begin(2,4,5,9,3,6);
  }
  if(i==3){
    rfid.begin(2,4,5,10,3,6);
  }
  if(i==4){
    rfid.begin(2,4,5,11,3,6);
  }
  if(i==5){
    rfid.begin(2,4,5,12,3,6);
  }
  if(i==6){
    rfid.begin(2,4,5,13,3,6);
  }
  delay(100);
  rfid.init();
  uchar status;
  uchar str[MAX_LEN];
  // Search card, return card types
  status = rfid.request(PICC_REQIDL, str);
  if (status != MI_OK)
  {
    Serial.println();
    return;
  }
  //Prevent conflict, return the 4 bytes Serial number of the card
  status = rfid.anticoll(str);
  if (status == MI_OK)
  {
    String cardId;
    memcpy(serNum, str, 5);
    int IDlen=4;
    for(int i=0; i<IDlen; i++){
      cardId += (0x0F & (serNum[i]>>4));
      cardId += (0x0F & serNum[i]);
    }

    //String num = String(str);
    Serial.print(cardId);
  }
  Serial.println("");
  rfid.halt(); //command the card into sleep mode 
  delay(100);
}
