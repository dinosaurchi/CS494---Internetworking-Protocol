__author__ = 'Tinh-Chi TRAN'
import cv2
import numpy as np

face_cascade = cv2.CascadeClassifier('Classifier/CV_Classifier/haarcascade_frontalface_default.xml')

def adjust_gamma(image, gamma=1.0):
    # build a lookup table mapping the pixel values [0, 255] to
    # their adjusted gamma values
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255
    for i in np.arange(0, 256)]).astype("uint8")

    # apply gamma correction using the lookup table
    return cv2.LUT(image, table)


def white_balance(img):
    img = np.log(img + 0.1) / np.log(20)
    cv2.normalize(img, img, 0, 255, cv2.NORM_MINMAX)
    return np.uint8(img)


def face_detection(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = white_balance(gray)
    #gray = adjust_gamma(gray, 5.5)
    #hist_mask = cv2.calcHist([gray],[0],None,[256],[0,256])
    #gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (255, 0, 0), 2)

    return img


def video_face_detection():
    cap = cv2.VideoCapture(0)
    cv2.namedWindow('face')

    while True:
        # Capture frame-by-frame
        ret, frame = cap.read()

        # Our operations on the frame come here
        image = cv2.resize(frame, (0, 0), fx=0.5, fy=0.5)
        image = face_detection(image)
        cv2.imshow('face', image)
        c = cv2.waitKey(1)
        if c == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()


def main():
    video_face_detection()


if __name__ == "__main__":
    main()